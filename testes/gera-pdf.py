# Gera PDFs FICTÍCIOS para teste: matrícula com texto e matrícula "escaneada" (só desenho, sem texto).
import sys
def pdf(caminho, linhas):
    def esc(s): return s.encode('cp1252').replace(b'\\', b'\\\\').replace(b'(', b'\\(').replace(b')', b'\\)')
    cont = b'BT /F1 9 Tf 40 800 Td 12 TL\n' + b''.join(b'(' + esc(l) + b') Tj T*\n' for l in linhas) + b'ET\n' if linhas else b'0.5 g 40 400 500 300 re f\n'
    objs = [b'<</Type/Catalog/Pages 2 0 R>>', b'<</Type/Pages/Kids[3 0 R]/Count 1>>',
            b'<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</Font<</F1 5 0 R>>>>/Contents 4 0 R>>',
            b'<</Length ' + str(len(cont)).encode() + b'>>stream\n' + cont + b'endstream',
            b'<</Type/Font/Subtype/Type1/BaseFont/Helvetica/Encoding/WinAnsiEncoding>>']
    out = b'%PDF-1.4\n'; offs = []
    for i, o in enumerate(objs): offs.append(len(out)); out += str(i + 1).encode() + b' 0 obj\n' + o + b'\nendobj\n'
    x = len(out)
    out += b'xref\n0 ' + str(len(objs) + 1).encode() + b'\n0000000000 65535 f \n' + b''.join(b'%010d 00000 n \n' % o for o in offs)
    out += b'trailer\n<</Size ' + str(len(objs) + 1).encode() + b'/Root 1 0 R>>\nstartxref\n' + str(x).encode() + b'\n%%EOF\n'
    open(caminho, 'wb').write(out)
pdf(sys.argv[1], [
  'REGISTRO DE IMÓVEIS DA COMARCA DE CIDADE EXEMPLO - SC (DOCUMENTO FICTÍCIO PARA TESTE)',
  'MATRÍCULA Nº 12.345 - Ficha 01',
  'IMÓVEL: Um terreno urbano com área de 1.250,50 m², situado na Rua Exemplo das Flores, nº 120,',
  'bairro Jardim Modelo, nesta cidade, com área construída de 380,00 m².',
  'Inscrição imobiliária nº 01.02.003.0456',
  'PROPRIETÁRIO: Empresa Fictícia Ltda.',
  'R-1/12.345 - Em 10/05/2001 - Transmissão por compra e venda.',
  'ADQUIRENTE: Município de Cidade Exemplo',
  'AV-2/12.345 - Em 03/04/2019 - Averbação de construção.'])
pdf(sys.argv[2], [])
print('ok')
