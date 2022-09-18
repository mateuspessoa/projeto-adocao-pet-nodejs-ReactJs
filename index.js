const express = require('express')
const cors = require('cors')


const app = express()

//Configuração da resposta JSON
app.use(express.json())

//Resolver o Cors
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))

//Pasta pública para imagens
app.use(express.static('public'))

//Rotas
const UserRoutes = require('./routes/UserRoutes')
const PetRoutes = require('./routes/PetRoutes')

app.use('/users', UserRoutes)
app.use('/pets', PetRoutes)

//Configurando a porta do backend
app.listen(5000)
