import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableUnique,
} from 'typeorm';

export default class AddSchedulesAndUserProfileFields1765069000000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'first_name',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'last_name',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'cpf',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'birth_date',
        type: 'date',
        isNullable: true,
      }),
    ]);

    await queryRunner.addColumn(
      'appointments',
      new TableColumn({
        name: 'status',
        type: 'varchar',
        default: "'pending'",
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'provider_schedules',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'provider_id',
            type: 'uuid',
          },
          {
            name: 'date',
            type: 'timestamp with time zone',
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'available'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'provider_schedules',
      new TableForeignKey({
        name: 'ProviderSchedulesProvider',
        columnNames: ['provider_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createUniqueConstraint(
      'provider_schedules',
      new TableUnique({
        name: 'ProviderSchedulesUniqueProviderDate',
        columnNames: ['provider_id', 'date'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropUniqueConstraint(
      'provider_schedules',
      'ProviderSchedulesUniqueProviderDate',
    );

    await queryRunner.dropForeignKey(
      'provider_schedules',
      'ProviderSchedulesProvider',
    );

    await queryRunner.dropTable('provider_schedules');

    await queryRunner.dropColumn('appointments', 'status');

    await queryRunner.dropColumns('users', [
      'first_name',
      'last_name',
      'cpf',
      'birth_date',
    ]);
  }
}
