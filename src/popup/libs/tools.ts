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
