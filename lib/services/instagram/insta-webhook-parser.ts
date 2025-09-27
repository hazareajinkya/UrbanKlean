import { IWAMessage } from "@/lib/types/wa-api";
import { IInstaMessage } from "@/lib/types/insta-api";

class InstaWebhookParser {
  parseTextMessage(body: any): IInstaMessage {
    const data = body.entry[0].messaging[0];

    const msg: IInstaMessage = {
      id: data.message.mid,
      from: data.sender.id,
      to: data.recipient.id,
      timestamp: data.timestamp,
      text: data.message.text,
      type: "text",
    };

    return msg;
  }

  // async parseImageMessage(body: any): Promise<{
  //   msg: IInstaMessage;
  // }> {
  //   const msg = body.entry[0].changes[0].value.messages[0];
  //   const waContact = body.entry[0].changes[0].value.contacts[0];

  //   const contact = {
  //     waId: waContact.wa_id,
  //     name: waContact.profile.name,
  //     phone: waContact.wa_id,
  //   };

  //   const mediaId = msg.image.id;

  //   console.log("mediaId: ", mediaId);

  //   const media = await waService.retrieveWAMedia(contact.waId, mediaId);

  //   msg.image.url = media.downloadUrl;
  //   msg.image.storageRef = media.storageRef;

  //   return {
  //     contact,
  //     msg,
  //   };
  // }
}

const instaParser = new InstaWebhookParser();
export default instaParser;
