import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 清理
  await prisma.auditLog.deleteMany();
  await prisma.mapping.deleteMany();
  await prisma.linkType.deleteMany();
  await prisma.property.deleteMany();
  await prisma.objectType.deleteMany();
  await prisma.ontologyVersion.deleteMany();
  await prisma.ontology.deleteMany();
  await prisma.queryEvent.deleteMany();
  await prisma.appPage.deleteMany();
  await prisma.appNavItem.deleteMany();
  await prisma.app.deleteMany();
  await prisma.alertRule.deleteMany();
  await prisma.alertEvent.deleteMany();
  await prisma.role.deleteMany();

  // 创建默认 Ontology
  const ontology = await prisma.ontology.create({
    data: {
      id: 'ont-default',
      name: '组织架构与供应链图谱',
      description: '核心生产力数据模具',
      status: 'published',
      latestPublishedVersion: 'v1.0.0',
      objectTypes: {
        create: [
          {
            id: 'ot-001',
            apiName: 'User',
            displayName: '用户 (User)',
            description: '组织内部人员信息',
            primaryKey: 'userId',
            properties: {
              create: [
                { id: 'p-1', apiName: 'userId', displayName: '用户 ID', type: 'string', required: true },
                { id: 'p-2', apiName: 'username', displayName: '姓名', type: 'string' },
                { id: 'p-3', apiName: 'email', displayName: '邮箱', type: 'string' }
              ]
            }
          },
          {
            id: 'ot-002',
            apiName: 'Order',
            displayName: '订单 (Order)',
            description: '业务交易订单记录',
            primaryKey: 'orderId',
            properties: {
              create: [
                { id: 'p-4', apiName: 'orderId', displayName: '订单编号', type: 'string', required: true },
                { id: 'p-5', apiName: 'amount', displayName: '金额', type: 'double' },
                { id: 'p-6', apiName: 'status', displayName: '订单状态', type: 'string' }
              ]
            }
          }
        ]
      },
      linkTypes: {
        create: [
          {
            id: 'lnk-1',
            apiName: 'user_orders',
            displayName: '用户下单关系',
            fromObject: 'User',
            toObject: 'Order',
            cardinality: 'OneToMany'
          }
        ]
      }
    }
  });

  // 创建默认 App
  const app = await prisma.app.create({
    data: {
      id: 'app-default',
      name: '供应链管理系统',
      description: '统一管理供应商、库存与分销渠道',
      status: 'active',
      icon: 'LayoutDashboard',
      pages: {
        create: [
          {
            id: 'page-1',
            name: '仪表盘',
            type: 'dashboard',
            config: JSON.stringify({ widgets: [] })
          },
          {
            id: 'page-2',
            name: '订单管理',
            type: 'list',
            config: JSON.stringify({ objectTypeId: 'ot-002' })
          }
        ]
      }
    }
  });

  // 创建 Query Events
  await prisma.queryEvent.createMany({
    data: [
      {
        id: 'qe-1',
        queryType: 'ONTOLOGY_READ',
        actorId: 'admin',
        traceId: 'tr-8822-11',
        durationMs: 42,
        resultCount: 1,
        parameters: JSON.stringify({ id: 'ont-default' })
      },
      {
        id: 'qe-2',
        queryType: 'OBJECT_TYPE_READ',
        actorId: 'admin',
        traceId: 'tr-9933-22',
        durationMs: 15,
        resultCount: 2,
        parameters: JSON.stringify({ ontologyId: 'ont-default' })
      }
    ]
  });

  // 创建 Alert Rules
  await prisma.alertRule.create({
    data: {
      name: '高延迟查询报警',
      category: 'PERFORMANCE',
      threshold: 'durationMs > 500',
      enabled: true,
      severity: 'high'
    }
  });

  // 创建 Roles
  await prisma.role.create({
    data: {
      name: 'Admin',
      description: 'Full system access',
      rules: {
        create: [
          { action: '*', resource: '*', effect: 'allow' }
        ]
      }
    }
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
