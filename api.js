const express = require("express")
const app = express()
const port = process.env.PORT || 8080

const loadStats = (epicId) => new Promise(async resolve => {
    const puppeteer = require('puppeteer-extra')
    const StealthPlugin = require('puppeteer-extra-plugin-stealth')
    puppeteer.use(StealthPlugin())
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    page.goto(`https://api.tracker.gg/api/v2/rocket-league/standard/profile/epic/${epicId}`)
    page.on('response', async (res) => {
        const data = await res.json()
        if (!data?.data?.segments[0]) {
            resolve({ error: 'no data' })
            return
        }
        const { data: { segments: [overview] } } = data
        const { stats } = overview
        resolve({
            wins: stats.wins.value,
            mvps: stats.mVPs.value,
            goals: stats.goals.value,
            saves: stats.saves.value,
            assists: stats.assists.value,
            shots: stats.shots.value,
            score: stats.score.value,
        })
        for(const stat in overview.stats) {
            overview.stats[stat] = overview.stats[stat].value
        }
        resolve(overview.stats)
    })
})

app.get('/:epicId', async (req, res) => {
    const { epicId } = req.params
    const resJson = await loadStats(epicId)
    res.send(resJson)
})

app.listen(port, () => console.log(`RL Stats API listening on port ${port}!`))
