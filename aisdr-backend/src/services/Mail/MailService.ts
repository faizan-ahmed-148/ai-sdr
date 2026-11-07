import MailInterface from "../../contract/MailInterface";
import config from "../../config/Mail.config"
import Local from "./Local";
import Bison from "./Bison";
import Gmail from "./Gmail";

class MailService  {
  
    private static providers = {
        'bison'     : Bison,
        'gmail'     : Gmail,
        'local'     : Local,
    };

    public static provider(provider: keyof typeof this.providers): MailInterface
    {
        const providerClass = this.providers[provider]
        return new providerClass(config[provider]);
    }

}

export default MailService;
