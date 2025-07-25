const { spec, request } = require('pactum');
const { describe, it, before, after } = require('mocha');

request.setBaseUrl('http://lojaebac.ebaconline.art.br');

describe('Testes de API - Categorias', () => {
    let token;
    let categoryId;

    before(async () => {
        token = await spec()
            .post('/public/authUser')
            .withJson({
                "email": "admin@admin.com",
                "password": "admin123"
            })
            .returns('data.token');
    });

    after(async () => {
        if (categoryId) {
            await spec()
                .delete(`/api/deleteCategory/${categoryId}`)
                .withHeaders('Authorization', token);
        }
    });

    it('API - Deve adicionar uma categoria com sucesso', async () => {
        const response = await spec()
            .post('/api/addCategory')
            .withHeaders('Authorization', token)
            .withJson({
                "name": "Nova Categoria Para Teste"
            })
            .expectStatus(200)
            .expectJson('success', true)
            .expectJsonLike('message', 'category added');

        categoryId = response.json.data._id;
    });

    it('API - Deve editar uma categoria com sucesso', async () => {
        await spec()
            .put(`/api/editCategory/${categoryId}`)
            .withHeaders('Authorization', token)
            .withJson({
                "name": "Nova Categoria Editada"
            })
            .expectStatus(200)
            .inspect()
            .expectJsonLike({
                "success": true,
            });
    });

    it('API - Deve deletar uma categoria com sucesso', async () => {
        await spec()
            .delete(`/api/deleteCategory/${categoryId}`)
            .withHeaders('Authorization', token)
            .expectStatus(200)
            .expectJson('success', true);
    });
});