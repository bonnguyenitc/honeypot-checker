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
    let data = true
    if (map.has(address)) {
      data = map.get(address)
    } else {
      if (isBSC || isEthereum) {
        data = await fetch(HONEYPOT_URL + address)
          .then((res) => res.json())
          .then((res) => {
            return {
              isHoneypot: res.honeypotResult?.isHoneypot ?? true,
              sellTax: res.simulationResult?.sellTax || 0,
              buyTax: res.simulationResult?.buyTax || 0,
              holders: res.holderAnalysis?.holders || 0,
            }
          })
          .catch(() => {
            return {
              isHoneypot: true,
              sellTax: 0,
              buyTax: 0,
              holders: 0,
            }
          })
      }
      map.set(address, data)
    }
    if (data.isHoneypot === true || data.isHoneypot === undefined) {
      element.style.setProperty('opacity', '0.1')
    } else {
      const childElements = element.querySelectorAll('*')
      for (let i = 0; i < childElements.length; i++) {
        if (childElements[i].classList.contains('ds-table-data-cell')) {
          childElements[i].style.setProperty('background-color', '#000 !important')
          var newChild = document.createElement('div')
          newChild.classList.add('info-extra')
          newChild.innerHTML = `
          <p>Holders: ${data.holders} |
          SellTax: ${Math.floor(data.sellTax)}% |
          BuyTax: ${Math.floor(data.buyTax)}%</p>
          `
          newChild.style.setProperty('width', '100%')
          newChild.style.setProperty('display', 'flex')
          newChild.style.setProperty('justify-content', 'center')
          newChild.style.setProperty('align-items', 'center')
          newChild.style.setProperty('margin-top', '10px')
          newChild.style.setProperty('font-weight', '500')
          newChild.style.setProperty('font-size', '14px')
          newChild.style.setProperty('background-color', '#0d2676')

          if (i === 0) {
            const childElements2 = childElements[0].querySelectorAll('*')
            let added = false
            const need = childElements2[childElements2.length - 2]
            if (need.classList.value.includes('info-extra')) added = true
            if (added) continue
            childElements[0].appendChild(newChild)
            childElements[0].style.setProperty('flex-wrap', 'wrap')
          }
        }
      }
    }
    await delay(500)
  }
  await delay(3 * 1000)
  await checking()
})()

export {}
