# Relatório FICTÍCIO no mesmo formato do "Consulta de Bem" do sistema atual (tabulação, ISO-8859-1, títulos, rodapé).
import sys, random
random.seed(7)
n = int(sys.argv[2]) if len(sys.argv) > 2 else 40
L = []
def lin(c): L.append('\t'.join(c + [''] * (17 - len(c))))
lin(['', '', 'MUNICÍPIO EXEMPLO - PREFEITURA', '', '', '', '', '', '', '', '', '', 'Pág', '', '1', '', '/'])
lin(['', '', 'Gerenciamento do Sistema'])
lin(['', '', 'Consulta de Bem'])
lin(['', '', 'Tipo: Todos / Status: Todos / Estado: Todos'])
lin(['Código', 'Tipo', '', '', 'Complemento', 'Aquisição', 'Data Início Depreciação', 'Valor Contábil', 'Status', 'Centro de Custo - Classificação', '', '', 'Características', '', 'Estado', '', ''])
nomes = ['CADEIRA GIRATÓRIA, ESTOFADA, COR PRETA', 'MESA DE ESCRITÓRIO 1,20 M', 'MONITOR 24 POLEGADAS, MARCA EXEMPLO', 'ARMÁRIO DE AÇO, DUAS PORTAS', 'AR CONDICIONADO SPLIT 9.000 BTUS']
cc = ['91.001.001', '91.001.002', '92.003.001.004', '93.010.002']
st = ['Disponível'] * 8 + ['Cedido', 'Em Desuso', 'Manutenção Corretiva']
es = ['Ótimo', 'Bom', 'Regular', 'Ruim', 'Péssimo']
for i in range(n):
    cod = str(90000 + i)
    tipo = 'Bens Imóveis' if i % 10 == 3 else 'Bens de Domínio Público' if i == 7 else 'Bens Móveis'
    comp = random.choice(nomes) + ' (FICTÍCIO)'
    if i == 1: comp = '"' + comp + '\nCOM DESCRIÇÃO EM DUAS LINHAS"'
    valor = f'{random.randint(50, 90000)},{random.randint(0, 99):02d}'
    if i == 5: valor = '1.234,56'
    estado = 'Inservível' if i == 4 else random.choice(es)
    lin([cod, tipo, '', '', comp, f'{random.randint(1, 28):02d}/{random.randint(1, 12):02d}/20{random.randint(10, 25)}', '05/10/2026', valor, random.choice(st), random.choice(cc), '', '', 'Característica fictícia' if i % 4 == 0 else '', '', estado, '', ''])
lin([str(90000 + 2), 'Bens Móveis', '', '', 'PLAQUETA REPETIDA (FICTÍCIO)', '01/01/2020', '05/10/2026', '10,00', 'Disponível', '91.001.001', '', '', '', '', 'Bom'])
lin(['Total de bens:', '', '', '', '', '', '', '', '', '', '', '', '', '', str(n + 1)])
lin(['Emitido em', '', '', '08/10/2026 12:00'])
open(sys.argv[1], 'w', encoding='latin-1', newline='').write('\r\n'.join(L) + '\r\n')
print('ok', n)
