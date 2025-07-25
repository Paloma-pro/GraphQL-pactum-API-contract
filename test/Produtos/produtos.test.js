const { spec, request } = require('pactum');
const { describe, it, before, after } = require('mocha');

request.setBaseUrl('http://lojaebac.ebaconline.art.br');

describe('Testes de API - Produtos', () => {
    let token;
    let categoryId;
    let productId;

    before(async () => {
        token = await spec()
            .post('/public/authUser')
            .withJson({
                "email": "admin@admin.com",
                "password": "admin123"
            })
            .returns('data.token');
        
        const categoryResponse = await spec()
            .post('/api/addCategory')
            .withHeaders('Authorization', token)
            .withJson({ "name": "Categoria para Produtos" });
        
        categoryId = categoryResponse.json.data._id;
    });

    it('API - Deve adicionar um produto com sucesso', async () => {
        const response = await spec()
            .post('/api/addProduct')
            .withHeaders('Authorization', token)
            .withJson({
                "name": "Produto de Teste",
                "price": 199.99,
                "categoryId": categoryId,
                "quantity": 20,
                "description": "Produto para testes",
                "photos": null
            })
            .expectStatus(200)
            .expectJson('success', true);
        
        productId = response.json.data._id;
    });

    it('API - Deve editar um produto com sucesso', async () => {
        await spec()
            .put(`/api/editProduct/${productId}`)
            .withHeaders('Authorization', token)
            .withJson({
                "name": "Produto de Teste Editado",
                "price": 249.50
            })
            .expectStatus(200)
            .inspect()
            .expectJsonLike('message', 'product updated');
    });

    it('API - Deve deletar um produto com sucesso', async () => {
        await spec()
            .delete(`/api/deleteProduct/${productId}`)
            .withHeaders('Authorization', token)
            .expectStatus(200)
            .expectJson('success', true);
    });

    after(async () => {
        if (categoryId) {
            await spec()
                .delete(`/api/deleteCategory/${categoryId}`)
                .withHeaders('Authorization', token);
        }
    });
});