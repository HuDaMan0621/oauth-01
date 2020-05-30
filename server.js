import express from 'express'
import fetch from 'node-fetch'

const app = express()
const client_id = process.env.GITHUB_CLIENT_ID
const client_secret = process.env.GITHUB_CLIENT_SECRET
console.log({ client_id, client_secret })

app.get('/', (req, res) => {
    res.send('test oauth 001')
})

app.get('/login/github', (req, res) => {
    const url = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=http://localhost:9000/login/github/callback`
    // console.log(url)
    res.redirect(url)
})

async function getAccessToken(code) {
    const res = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            client_id,
            client_secret,
            code
        })
    })
    const data = await res.text()
    const params = new URLSearchParams(data)
    return params.get('access_code')
}

async function getGithubUser(access_token) {
    const req = await fetch('https://api.github.com/user', {
        headers: {
            Authorization: `bearer ${access_token}`
        }
    })
    const data = await req.json()
    return data
}

app.get('/login/github/callback', async (req, res) => {
    const code = req.query.code
    const token = await getAccessToken(code)
    const githubData = await getGithubUser(token);
    res.json(githubData);
    // getAccessToken(code)
    // console.log('callback');
})


const PORT = process.envPOR || 9000
app.listen(PORT, () => console.log('Listening http://localhost:' + PORT))