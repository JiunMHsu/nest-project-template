import {
    Column,
    CreateDateColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export abstract class PersistentEntity {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    public id: string;

    @CreateDateColumn({
        type: 'timestamp',
        name: 'created_at',
    })
    public createdAt: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        name: 'updated_at',
    })
    public updatedAt: Date;

    @Column('boolean', { name: 'is_active', default: true, nullable: false })
    public isActive: boolean;
}
