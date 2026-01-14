import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddRoleToUsers1765067071454 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "users",
      new TableColumn({
        name: "role",
        type: "varchar",
        isNullable: false,
        default: "'client'",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("users", "role");
  }
}
