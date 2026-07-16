# Memorial OS - Copilot Instructions

## Arquitetura

- Utilize Python + Django.
- Utilize PostgreSQL + PostGIS.
- O projeto segue DDD.
- O projeto segue SOLID.
- O projeto segue Clean Architecture.

## Organização

Nunca coloque regra de negócio em:

- admin.py
- views.py
- serializers.py
- forms.py

Toda regra deve ficar em:

- services.py
- queries.py
- repositories.py
- metrics.py
- widgets.py

## Segurança

- Nunca excluir registros críticos.
- Utilizar Soft Delete.
- Toda alteração deve gerar auditoria.
- Utilizar UUID.
- Seguir LGPD.
- Seguir OWASP Top 10.

## Banco

Utilizar PostgreSQL.

Utilizar PostGIS para localização.

Preparar estrutura para:

- Backup
- PITR
- Hot Standby

## Código

Sempre utilizar:

- Type Hints
- Docstrings
- PEP-8
- DRY
- KISS
- Código reutilizável

Sempre explicar os arquivos criados.

Sempre sugerir melhorias arquiteturais quando apropriado.

Nunca gerar código duplicado.