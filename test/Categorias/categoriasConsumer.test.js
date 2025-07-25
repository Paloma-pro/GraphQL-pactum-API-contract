const { reporter, flow, handler, mock } = require('pactum');
const { like, string } = require('pactum-matchers');
const pf = require('pactum-flow-plugin');

// Configuração do Pactum Flow Reporter (opcional, mas bom para visualização)
function addFlowReporter() {
    pf.config.url = 'http://localhost:8080';
    pf.config.projectId = 'lojaebac-front';
    pf.config.projectName = 'Loja EBAC Front';
    pf.config.version = '1.0.1'; 
    pf.config.username = 'scanner';
    pf.config.password = 'scanner';
    reporter.add(pf.reporter);
}

// Inicia o servidor mock antes dos testes
before(async () => {
    addFlowReporter();
    await mock.start(4000);
});

// Para o servidor mock depois dos testes
after(async () => {
    await mock.stop();
    await reporter.end();
});

// Define a "interação" que o consumidor espera do provedor
handler.addInteractionHandler('addCategory success', () => {
    return {
        provider: 'lojaebac-api',
        flow: 'Add Category',
        request: {
            method: 'POST',
            path: '/api/addCategory',
            headers: {
                'Authorization': like('some-valid-token') // O token pode ser qualquer um
            },
            body: {
                "name": "Categoria Contrato"
            }
        },
        response: {
            status: 200,
            body: {
                "success": true,
                "message": string("category created"),
                "data": {
                    "_id": like("65d4e13d1b6b93081e64906b"), // O ID pode ser qualquer string válida
                    "name": "Categoria Contrato"
                }
            }
        }
    }
});

it('FRONT - Deve criar uma categoria com sucesso', async () => {
    await flow('Add Category')
        .useInteraction('addCategory success') // Usa a interação definida acima
        .post('http://localhost:4000/api/addCategory') // Note que a URL aponta para o mock server
        .withHeaders('Authorization', 'some-valid-token')
        .withJson({
            "name": "Categoria Contrato"
        })
        .expectStatus(200)
        .inspect()
        .expectJsonLike('data.name', 'Categoria Contrato');
});
