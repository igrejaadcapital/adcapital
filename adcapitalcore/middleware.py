"""Middlewares globais da API AD Capital."""


class LegacyApiDeprecationMiddleware:
    """Marca respostas do prefixo legado /api/ (sem /v1/) como depreciadas."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        path = request.path
        if path.startswith('/api/') and not path.startswith('/api/v1/'):
            response['Deprecation'] = 'true'
            response['Sunset'] = 'Sun, 31 Dec 2026 23:59:59 GMT'
            response['Link'] = '</api/v1/>; rel="successor-version"'
        return response
