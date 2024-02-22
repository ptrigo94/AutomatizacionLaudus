require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
// Obtener las credenciales de las variables de entorno
const user = process.env.NECGROUP_USER;
const password = process.env.NECGROUP_PASSWORD;
const vatID = process.env.NECGROUP_VAT_ID;
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
            return (token);
           // getListaProductos(token)
        } else {
            console.error('Error al obtener el token:', response.status);
        }
       
    } catch (error) {
        console.error('Error al realizar la solicitud:', error.message);
    }
}

async function getListaProductos(tokenObtenido) {
    try {
        //CAMBIAR RUTA POR STOCK
        const response = await axios.post(`${baseUrl}/production/products/list`, {
            options: {
                offset: 0,
                limit: 0
            },
            fields: [
                "productId", "sku", "description","unitPrice", "unitPriceWithTaxes", 
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${tokenObtenido}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        fs.writeFile('./Laudus/Necgroup.json', JSON.stringify(response.data), (err) => {
            if (err) {
                console.error('Error al escribir el archivo JSON:', err);
                return;
            }
            console.log('Productos de Necgroup obtenidos');
        });
        
    } catch (error) {
        console.error('Error al obtener los precios:', error.message);
    }
}

async function getStockProductos(tokenObtenido, productId ){
    try {
        const response = await axios.get(`${baseUrl}/production/products/${productId}/stock` , {headers: {
            'Authorization': `Bearer ${tokenObtenido}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }});
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}


module.exports = {
    login, getListaProductos, getStockProductos
};