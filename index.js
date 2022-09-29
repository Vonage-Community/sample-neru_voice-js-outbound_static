import { Voice, neru } from 'neru-alpha';
import express from 'express';

const app = express();
const port = process.env.NERU_APP_PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/_/health', async (req, res) => {
    res.sendStatus(200);
});

app.get('/', async (req, res) => {
    res.sendFile('views/index.html', { root: '.' });
});

app.post('/call', async (req, res, next) => {
    try {  
        const session = neru.createSession();
        const voice = new Voice(session);

        const vonageNumber = { type: 'phone', number: process.env.VONAGE_NUMBER };
        const to = { type: 'phone', number: req.body.number };
    
        const response = await voice
            .vapiCreateCall(
                vonageNumber,
                [to],
                [
                    {
                        action: 'talk',
                        text: "Hi! This is a call made by the Voice API and NeRu",
                    }
                ]
            )
            .execute();
        
        await voice.onVapiEvent({ vapiUUID: response?.uuid, callback: 'onEvent' }).execute();
        
        res.redirect('/');
    } catch (error) {
        next(error);
    }
});

app.post('/onEvent', async (req, res) => {
    console.log('event status is: ', req.body.status);
    console.log('event direction is: ', req.body.direction);
    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});