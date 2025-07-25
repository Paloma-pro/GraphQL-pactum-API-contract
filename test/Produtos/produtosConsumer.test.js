const { reporter, flow, handler, mock } = require('pactum');
const { like, string, number } = require('pactum-matchers');
const pf = require('pactum-flow-plugin');

function addFlowReporter() {
    pf.config.url = 'http://localhost:8080';
    pf.config.projectId = 'lojaebac-front';
    pf.config.projectName = 'Loja EBAC Front';
    pf.config.version = '1.0.0'; 
    pf.config.username = 'scanner';
    pf.config.password = 'scanner';
    reporter.add(pf.reporter);
}

before(async () => {
    addFlowReporter();
    await mock.start(4000);
});

after(async () => {
    await mock.stop();
    await reporter.end();
});

handler.addInteractionHandler('addProduct success', () => {
    return {
        provider: 'lojaebac-api',
        flow: 'Add Product',
        request: {
            method: 'POST',
            path: '/api/addProduct',
            headers: {
                'Authorization': like('some-valid-token')
            },
            body: {
                "name": "Produto Contrato",
                "price": 299,
                "categoryId": like("65d4e13d1b6b93081e64906b")
            }
        },
        response: {
            status: 200,
            body: {
                "success": true,
                "message": string("product created"),
                "data": {
                    "_id": like("65d4e1a01b6b93081e64906f"),
                    "name": "Produto Contrato",
                    "price": 299
                }
            }
        }
    }
});

it('FRONT - Deve criar um produto com sucesso', async () => {
    await flow('Add Product')
        .useInteraction('addProduct success')
        .post('http://localhost:4000/api/addProduct')
        .withHeaders('Authorization', 'some-valid-token')
        .withJson({
            "name": "Produto Contrato",
            "price": 299,
            "categoryId": "65d4e13d1b6b93081e64906b"
        })
        .expectStatus(200)
        .inspect()
        .expectJsonLike('data.price', 299);
});