import express from 'express'
import fetch from 'node-fetch'
import cookieSession from "cookie-session"
const app = express();

const client_id = process.env.GITHUB_CLIENT_ID;
const client_secret = process.env.GITHUB_CLIENT_SECRET;
const cookie_secret = process.env.COOKIE_SECRET;

app.use(cookieSession({
    secret: cookie_secret
}))

app.get('/', (req, res) => {
    res.send('test oauth 001')
});

app.get('/login/github', (req, res) => {
    const url = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=http://localhost:9000/login/github/callback`
    console.log(url);
    res.redirect(url);
});

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
    const data = await res.text();
    const params = new URLSearchParams(data);
    return params.get('access_code');
}

async function getGithubUser(access_token) {
    const req = await fetch('https://api.github.com/user', {
        headers: {
            Authorization: `bearer ${access_token}`
        }
    })
    const data = await req.json();
    return data;
}

app.get('/login/github/callback', async (req, res) => {
    const code = req.query.code;
    const token = await getAccessToken(code);
    const githubData = await getGithubUser(token);
    if(githubData) {
        req.session.githubID = githubData.id
        req.session.token = token
        res.redirect('/admin')
    } else {
        console.log('Error')
        res.send('Error happened')
    }
    // if(githubData.id === "this is going to be an integer when you can sign in again") {
    //     res.send('Hello HudaMan')
    // } else {
    //     res.send("Not authorized");
    // }
    res.json(githubData);
    // getAccessToken(code)
    // console.log('callback');
});

app.get('/admin', (req, res ) => {
    if(req,session.githubId === "we need that later on") {
        res.send("hello youhu <pre>" +JSON.stringify )
    } else {
        res.send('Not authorized, <a href="/login/github">login</a>');
    }
});

app.get('/logout', (req, res) => {
    req.session = null
    res.redirect('/')
})

const PORT = process.envPOR || 9000
app.listen(PORT, () => console.log('Listening http://localhost:' + PORT));