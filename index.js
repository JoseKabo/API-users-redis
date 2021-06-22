const express = require('express');
const uuid = require('uuid');
const app = express();
const redis = require('redis');
const client = redis.createClient();

client.on('error', () => {
    console.log('error');
});

app.use(express.json({
    type: '*/*'
}));

// solo puedes registrar nuevos usuarios, obtener un usuario con su matricula y contestar la encuesta personal

// uid = matricula ej 17193
app.get('/get-student/:uid', (request, response) => {
    debugger;
    const uid = request.params.uid;

    client.hgetall(uid, (err, reply) => {
        if (err) response.json({ error: true, msg: err });
        response.json({ error: false, msg: reply });
    });
});

app.post('/new-student', (request, response) => {
    const user = request.body;
    client.exists(user.id_user, (err, reply) => {
        if (reply === 1) {
            return response.json({ status: 400, msg: 'El usuario ya existe', user });
        }

        const x = uuid.v1();
        client.hmset(user.uid, [
            'id_user', x,
            'name', user.name,
            'matricula', user.uid,
            'age', user.age,
            'birthday', user.birthday,
            'genre', user.genre,
            'speciality', user.speciality,
            'school', user.school,
            'city_born', user.city_born,
        ], (err, reply) => {
            if (err) return response.json({ error: true, msg: err });
            response.json({ error: false, msg: reply });
        });

    });
});

app.post('/personal-survey/:uid', (request, response) => {
    const userId = request.params.uid;
    const user = request.body;
    client.exists(userId, (err, reply) => {
        if (reply < 1) {
            return response.json({ status: 400, msg: 'El usuario no existe', userId });
        }
        const x = uuid.v1();
        client.hmset(`personal-${userId}`, [
            'survey_uid', x,
            'name', 'personal',
            'student', userId,
            'residencia', user.residencia,
            'sangre', user.sangre,
            'religion', user.religion,
            'e_civil', user.e_civil,
            'curp', user.curp,
            'nss', user.nss,
            'telefono', user.telefono,
            'preferencia', user.preferencia,
            'lengua_nativa', user.lengua_nativa,
            'decendencia_indigena', user.decendencia,

        ], (err, _) => {
            if (err) response.json({ error: true, msg: err });
            response.json({ error: false, msg: 'se agrego encuesta personal correctamente' });
        });
    });
});


app.listen(3000, () => {
    console.log('Server running in port 3000');
});