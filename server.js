import express from 'express';
import fetch from 'node-fetch';
import cookieSession from "cookie-session";
// var GitHubStrategy = require('passport-github').Strategy;
const app = express()

const client_id = process.env.GITHUB_CLIENT_ID;
const client_secret = process.env.GITHUB_CLIENT_SECRET;
const cookie_secret = process.env.COOKIE_SECRET;
console.log({ client_id, client_secret });

app.use(
    cookieSession({
        secret: cookie_secret
    })
);

app.get('/', (req, res) => {
    res.send('testoauth001')
})

app.get('/login/github', (req, res) => {
    const url = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=http://localhost:9000/login/github/callback`
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
    return params.get('access_token')
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
    // res.json(githubData);
    if (githubData) {
        req.session.githubId = githubData.id
        req.session.token = token
        res.redirect('/admin')
    } else {
        console.log("Error")
        res.send('Error happened')
    }
    // if (githubData.id === 5769481) {
    //     res.send('Hello Ying!!!!! a baby step accomplished');
    // } else {
    //     res.send('Not authorized');
    // }
    // res.json({token});
})

app.get("/admin", (req, res) => {
    if (req.session.githubId === 57694281) {
        res.send("HEllo Ying <pre>" + JSON.stringify(req.session));
    } else {
        res.send('Not authorized, <a href="/login/github">login</a>');
    }
});

app.get('/logout', (req, res) => {
    req.session = null
    res.redirect('/') //redirect to the home page
})

const PORT = process.envPOR || 9000
app.listen(PORT, () => console.log('Listening http://localhost:' + PORT))