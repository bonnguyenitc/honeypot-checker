// constants
const HONEYPOT_URL = 'https://api.honeypot.is/v2/IsHoneypot?address='
const STAYSAFU_URL = 'https://api.staysafu.org/api/freescan?tokenAddress='
const ISRUG = function (addr) {
  return `https://api.isrug.app/tokens/scan?mode=basic&addr=${addr}&chain=arbitrum`
}

// history change
// Add listener for window location change
let prevHref = window.location.href
let nextHref = window.location.href
let diffHref = false

setInterval(() => {
  prevHref = nextHref
  nextHref = window.location.href
  if (prevHref !== nextHref) diffHref = true
}, 1000)

const delay = async (time) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), time)
  })
}

const map = new Map()

;(async function checking() {
  let listItems = []

  while (listItems.length === 0) {
    listItems = document.querySelectorAll('.ds-dex-table-row-top')
    if (listItems.length === 0) {
      listItems = document.querySelectorAll('.ds-dex-table-row')
    }
  }

  for (const element of listItems) {
    if (diffHref) {
      diffHref = false
      break
    }
    const els = element.getAttribute('href')?.split('/')
    const net = els?.[1]
    const isBSC = net === 'bsc'
    const isEthereum = net === 'ethereum'
    const address = els?.[2]
    let isHoneypot = true
    if (map.has(address)) {
      isHoneypot = map.get(address)
    } else {
      if (isBSC || isEthereum) {
        isHoneypot = await fetch(HONEYPOT_URL + address)
          .then((res) => res.json())
          .then((res) => {
            return res.honeypotResult?.isHoneypot
          })
          .catch(() => true)
      }
      map.set(address, isHoneypot)
    }
    if (isHoneypot === true || isHoneypot === undefined) {
      element.style.setProperty('opacity', '0.1')
    } else {
      const childElements = element.querySelectorAll('*')
      for (let i = 0; i < childElements.length; i++) {
        if (childElements[i].classList.contains('ds-table-data-cell')) {
          childElements[i].style.setProperty('background-color', '#000 !important')
        }
      }
    }
    await delay(500)
  }
  await delay(3 * 1000)
  await checking()
})()

export {}
