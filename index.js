const express = require('express');
var morgan = require('morgan');
const rateLimit = require('express-rate-limit')
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
const app = express();
require('dotenv').config();

app.use(morgan('combined'));

const limiter = rateLimit({
	windowMs: 02 * 60 * 1000, // 02 minutes
	max: 5, // Limit each IP to 5 requests per `window` (here, per 2 minutes)
})

app.use(limiter);

app.use('/flights', createProxyMiddleware({ target: 'http://localhost:3000', changeOrigin: true }));
app.use('/airports', createProxyMiddleware({ target: 'http://localhost:3000', changeOrigin: true }));
app.use('/airplanes', createProxyMiddleware({ target: 'http://localhost:3000', changeOrigin: true }));
app.use('/cities', createProxyMiddleware({ target: 'http://localhost:3000', changeOrigin: true }));

app.use('/bookingservice', async (req, res, next) => {
    
    try {
        const response = await axios.get('http://localhost:3001/api/v1/isAuthenticated', {
            headers: {
                'x-access-token': req.headers['x-access-token']
            }
        })
    
        if(response.data.success){
            next()
        }
        else{
            res.status(401).json({
                message:"user is Unauthorized"
            })
        }
    } catch (error) {
        res.status(401).json({
            message:"user is Unauthorized"
        })
    }

})

app.use('/bookingservice', createProxyMiddleware({ target: 'http://localhost:3002', changeOrigin: true }));


app.listen(process.env.Port, () => {
    console.log(`Server started on port ${process.env.Port}`);
})