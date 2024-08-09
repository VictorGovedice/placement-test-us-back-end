const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const csvtojson = require('csvtojson');
const app = express();
const port = 3001;

app.use(cors({
  origin: 'https://placement-test-us-front-end.vercel.app',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API and Integrations of Alumini / BetterEdu 🇺🇸 ');
});

app.post('/api/teste-nivelamento', async (req, res) => {
  const { nomeCompleto, email, telefone } = req.body;
  
  const userId = uuidv4();
  
  // URL de retorno para enviar resultados
  const scoreSubmissionUrl = `https://e-learning-website.com/submit_speechace_scores?courseid=91&testid=25&userid=${encodeURIComponent(userId)}`;

  try {
    const apiUrl = `https://speak.speechace.co/embed/oembed?url=https%3A%2F%2Fspeak.speechace.co%2Fplacement%2Fapi%2Fcourse%2F4097%2F&key=sqZQCXaWWJvO5T0F&app_user_email=${encodeURIComponent(email)}&app_user_fullname=${encodeURIComponent(nomeCompleto)}&app_user_id=${encodeURIComponent(userId)}&app_score_submission_url=${encodeURIComponent(scoreSubmissionUrl)}`;

    const response = await axios.get(apiUrl);

    // Verifica se a resposta contém o HTML do iframe
    if (response.data && response.data.html) {
      const iframeHtml = response.data.html;

      // envia dados para o clint
      await axios.post('https://functions-api.clint.digital/endpoints/integration/webhook/5ab303df-1d88-47cd-9364-467d8da5efff', {
        nome: nomeCompleto,
        email: email,
        telefone: telefone,
        id: userId,
        iframeHtml: iframeHtml,
      });

      // Envia o HTML gerado e o ID como JSON para o front-end
      res.json({ html: iframeHtml, nomeCompleto, email, telefone, id: userId });
    } else {
      res.status(500).json({ message: 'Não foi possível gerar o iframe' });
    }

  } catch (error) {
    console.error('Erro ao processar os dados:', error);
    res.status(500).json({ message: 'Erro ao processar os dados' });
  }
});

app.get('/api/baixar-csv', async (req, res) => {
  const csvUrl = 'https://speak.speechace.co/placement/api/course/4097/report/csv/?speechace_auth_token=626fcf81e42352d74f132d734dd772b8290e3676';

  try {
    const response = await axios.get(csvUrl);

    const json = await csvtojson().fromString(response.data);

    res.json(json);
    console.log(json)
  } catch (error) {
    console.error('Erro ao baixar ou converter o CSV:', error);
    res.status(500).json({ message: 'Erro ao baixar ou converter o CSV' });
  }
});

app.listen(port, () => {
  console.log(`Server running at https://placement-test-us-back-end.onrender.com/`);
});
