import { IWAContact, IWAMessage } from "@/lib/types/wa-api";
import waService from "./wa-service";
import { UIMessage } from "ai";
import { IChatMessage } from "@/lib/types/session";

class WAWebhookParser {
  parseTextMessage(body: any): {
    contact: IWAContact;
    msg: IWAMessage;
  } {
    const msg = body.entry[0].changes[0].value.messages[0];
    const waContact = body.entry[0].changes[0].value.contacts[0];

    const contact = {
      waId: waContact.wa_id,
      name: waContact.profile.name,
      phone: waContact.wa_id,
    };

    msg.text = msg.text.body;

    return {
      contact,
      msg,
    };
  }

  async parseImageMessage(
    body: any,
    phoneId: string
  ): Promise<{
    contact: IWAContact;
    msg: IWAMessage;
  }> {
    const msg = body.entry[0].changes[0].value.messages[0];
    const waContact = body.entry[0].changes[0].value.contacts[0];

    const contact = {
      waId: waContact.wa_id,
      name: waContact.profile.name,
      phone: waContact.wa_id,
    };

    const mediaId = msg.image.id;

    console.log("mediaId: ", mediaId);

    const media = await waService.retrieveWAMedia({
      phone: contact.waId,
      mediaId,
      phoneId,
    });

    msg.image.url = media.downloadUrl;
    msg.image.storageRef = media.storageRef;

    return {
      contact,
      msg,
    };
  }
}

const waParser = new WAWebhookParser();
export default waParser;
