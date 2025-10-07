import {
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  collectionGroup,
  collection,
  where,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../clients/firebase";
import { IChannel, IChannelProvider } from "../types/channel";

class ChannelService {
  async getChannels(wid: string) {
    const q = query(collection(db, `workspaces/${wid}/channels`));
    const snaps = await getDocs(q);
    const channels = snaps.docs.map((doc) => doc.data()) as IChannel[];
    console.log("channels: ", channels.length);

    return channels ?? [];
  }

  async addChannel(wid: string, channel: IChannel) {
    await setDoc(doc(db, `workspaces/${wid}/channels/${channel.id}`), channel, {
      merge: true,
    });
  }

  async getChannel(wid: string, channelId: string) {
    const channel = await getDoc(
      doc(db, `workspaces/${wid}/channels/${channelId}`)
    );
    if (!channel.exists()) return null;
    return channel.data() as IChannel;
  }

  async deleteChannel(wid: string, channelId: string) {
    const channel = await this.getChannel(wid, channelId);
    if (!channel) return;
    const agentId = channel.assignedAgentId;
    await deleteDoc(doc(db, `workspaces/${wid}/channels/${channelId}`));
    if (agentId)
      await updateDoc(doc(db, `agents/${agentId}`), {
        channels: arrayRemove(channelId),
      });
  }

  async assignAgentToChannel(wid: string, channelId: string, agentId: string) {
    await updateDoc(doc(db, `workspaces/${wid}/channels/${channelId}`), {
      assignedAgentId: agentId,
    });

    await updateDoc(doc(db, `agents/${agentId}`), {
      channels: arrayUnion(channelId),
    });
  }

  async resolveAgent(providerAccountId: string, provider: IChannelProvider) {
    const q = query(
      collectionGroup(db, "channels"),
      where("metadata.id", "==", providerAccountId),
      where("provider", "==", provider)
    );
    const snaps = await getDocs(q);
    const channels = snaps.docs.map((doc) => doc.data()) as IChannel[];
    if (channels.length === 0) return null;
    return channels[0]?.assignedAgentId;
  }

  async getChannelDirectly(channelId: string) {
    const q = query(
      collectionGroup(db, "channels"),
      where("id", "==", channelId)
    );
    const snaps = await getDocs(q);
    const channels = snaps.docs.map((doc) => doc.data()) as IChannel[];
    if (channels.length === 0) return null;
    return channels[0];
  }

  async unassignAgentFromChannel(
    wid: string,
    channelId: string,
    agentId: string
  ) {
    await updateDoc(doc(db, `workspaces/${wid}/channels/${channelId}`), {
      assignedAgentId: "",
    });

    await updateDoc(doc(db, `agents/${agentId}`), {
      channels: arrayRemove(channelId),
    });
  }
}

const channelService = new ChannelService();
export default channelService;
