import { Voice, neru } from 'neru-alpha';
import { fileURLToPath } from 'url';
import express from 'express';
import path from 'path';

const router = neru.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.use(express.static(path.join(__dirname, 'public')))

router.get('/', async (req, res) => {
    res.sendFile('views/index.html', { root: '.' });
});

router.post('/call', async (req, res, next) => {
    try {  
        const session = neru.createSession();
        const voice = new Voice(session);

        const vonageNumber = JSON.parse(process.env.NERU_CONFIGURATIONS).contact;
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
        
        await voice.onVapiEvent(response?.uuid, 'onEvent').execute();
        
        res.redirect('/');
    } catch (error) {
        next(error);
    }
});

router.post('/onEvent', async (req, res) => {
    console.log('event status is: ', req.body.status);
    console.log('event direction is: ', req.body.direction);
    res.sendStatus(200);
});

export { router };