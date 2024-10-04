const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8580;
const VOTES_FILE = path.join(__dirname, 'votes.json');

// Middleware для парсинга JSON
app.use(bodyParser.json());
app.use(express.static('public'));

// GET-сервис для получения вариантов
app.get('/variants', (req, res) => {
    fs.readFile(VOTES_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send("Ошибка чтения файла.");
        }
        const votes = JSON.parse(data);
        res.json(votes.votes);
    });
});

// POST-сервис для получения статистики
app.post('/stat', (req, res) => {
    fs.readFile(VOTES_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send("Ошибка чтения файла.");
        }
        const votes = JSON.parse(data);
        const statistics = Object.entries(votes.votes).map(([key, value]) => ({
            code: key,
            count: value.count
        }));
        res.json(statistics);
    });
});

// POST-сервис для принятия голоса
app.post('/vote', (req, res) => {
    const voteCode = req.body.code;

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
    console.log(`Сервер работает на http://localhost:${PORT}`);
});