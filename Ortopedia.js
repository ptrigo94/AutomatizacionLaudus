require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
// Obtener las credenciales de las variables de entorno
const user = process.env.ORTOPEDIA_USER;
const password = process.env.ORTOPEDIA_PASSWORD;
const vatID = process.env.ORTOPEDIA_VAT_ID;
const baseUrl = process.env.API_URL;

let token='';
async function login() {
    try {
        const response = await axios.post(`${baseUrl}/security/login`, {
            userName: user,
            password: password,
            companyVATId: vatID
        });
        
        if (response.status === 200) {
            token = response.data.token;
            getPrecios(token);
        } else {
            console.error('Error al obtener el token:', response.status);
        }
        return ('OrtopediaOk');
    } catch (error) {
        console.error('Error al realizar la solicitud:', error.message);
    }
}

async function getPrecios(tokenObtenido) {
    try {
        const response = await axios.post(`${baseUrl}/production/products/list`, {
            options: {
                offset: 0,
                limit: 0
            },
            fields: [
                "productId","sku", "unitPrice", "unitPriceWithTaxes", "description"
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${tokenObtenido}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        fs.writeFile('./Laudus/Ortopedia.json', JSON.stringify(response.data), (err) => {
            if (err) {
                console.error('Error al escribir el archivo JSON:', err);
                return;
            }
            console.log('Productos de ortopedia obtenidos');
        });
    } catch (error) {
        console.error('Error al obtener los precios:', error.message);
    }
}
login();

module.exports = {
    login
};

