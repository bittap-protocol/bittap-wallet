import bs58check from 'bs58check-ts'
import { Buffer } from 'buffer'

export function TestPassword(pwd) {
    return /^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/.test(pwd)
}

export function TestUrl(url) {
    // return /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/.test(url)
    return /^(http|ftp|https):\/\/[\w\-_]+/.test(url)
}


export function postMsg(eventType, data){
    window.postMessage({ event: eventType, data: data }, '*')
}

export function postToast(text, type = 'error', delay = 3000){
    postMsg('toast', { text, type, delay })
}


export function sendMessage(type, data){
    chrome.runtime.sendMessage(null,{ type, data: data })  
}

export function convertXpubToOther(xpub:string, targetFormat: string) { 
    const prefixes:Map<string, string> = new Map(
    [
        ['xpub', '0488b21e'],
        ['ypub', '049d7cb2'],
        ['Ypub', '0295b43f'],
        ['zpub', '04b24746'],
        ['Zpub', '02aa7ed3'],
        ['tpub', '043587cf'],
        ['upub', '044a5262'],
        ['Upub', '024289ef'],
        ['vpub', '045f1cf6'],
        ['Vpub', '02575483'],
    ]
    );
    if (!prefixes.has(targetFormat)) {
    return "Invalid target version";
  }

  try {
    let data = bs58check.decode(xpub.trim());
    data = data.slice(4);
    data = Buffer.concat([Buffer.from(prefixes.get(targetFormat),'hex'), data]);
    return bs58check.encode(data);
  } catch (err) {
    return "Invalid extended public key! Please double check that you didn't accidentally paste extra data.";
  }
    
}