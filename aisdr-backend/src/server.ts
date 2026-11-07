import express          from 'express'
import cors             from 'cors'
import cookieParser     from 'cookie-parser'
import api              from './routes/api'
import webhooks         from './routes/webhooks'
import { activeClients }from './socket'
import { Logger } from './utils'

const app  = express()

// Middlewares
app.use(cors())           
app.use(express.static('public'))  
app.use(express.json({limit: '500mb'}))  
app.use(cookieParser())
app.use('/api',api)
app.use('/webhooks',webhooks)

// ping
app.get("/", (req, res) => {
  Logger.info("Ping received from client")
  res.send("app running...")
});

export default app