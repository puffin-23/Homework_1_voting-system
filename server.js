const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 8581;
const VOTES_FILE = path.join(__dirname, 'votes.json');

// Middleware для парсинга JSON
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors());

// GET-сервис для получения вариантов
app.get('/variants', (req, res) => {
    fs.readFile(VOTES_FILE, 'utf8', (err, data) => {

        if (err) {
            return res.status(500).send("Ошибка чтения файла.");
        }

        const votes = JSON.parse(data);
        const variants = Object.entries(votes.votes).map(([key, value]) => ({
            code: key,
            text: value.text
        }))

        res.send(variants);
    });
});

// POST-сервис для получения статистики
app.post('/stat', (req, res) => {
    const clientAccept = req.headers.accept;
    fs.readFile(VOTES_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send("Ошибка чтения файла.");
        }

        const votes = JSON.parse(data);

        const statistics = Object.entries(votes.votes).map(([key, value]) => ({
            code: key,
            count: value.count
        }))

        // т.к. к этому сервису идёт AJAX-запрос со страниц с другим происхождением (origin), надо явно это разрешить
        res.setHeader('Access-Control-Allow-Origin', '*');

        // установка заголовка Content-Type для ответа
        if (clientAccept === 'application/json') {
            res.setHeader('Content-Type', 'application/json');
            res.send(statistics);
        } else if (clientAccept === 'application/xml') {
            res.setHeader('Content-Type', 'application/xml');
            res.send(statisticsToXML(statistics));
        } else {
            res.setHeader('Content-Type', 'text/html');
            res.send(statistics);

        };
    });
});

// POST-сервис для принятия голоса
app.post('/vote', (req, res) => {

    let code = req.body.code;

    let voteCode = ++code;

    fs.readFile(VOTES_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send("Ошибка чтения файла.");
        }
        const votes = JSON.parse(data);

        if (votes.votes[voteCode]) {

            votes.votes[voteCode].count += 1; // Увеличиваем счетчик голосов

            fs.writeFile(VOTES_FILE, JSON.stringify(votes, null, 2), (err) => {

                if (err) {
                    return res.status(500).send("Ошибка записи в файл.");
                }

                res.sendStatus(200);
            });
        } else {
            res.status(400).send("Неверный код ответа.");
        }
    });
});

// Настройка запроса главной страницы
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер работает на порту ${PORT}`);
});


function statisticsToXML(statistics) {
    let xml = '<statistics>';
    statistics.forEach(stat => {
        xml += '<stat>';
        xml += `<code>${stat.code}</code>`;
        xml += `<count>${stat.count}</count>`;
        xml += '</stat>';
    });
    xml += '</statistics>';
    return xml;
}

