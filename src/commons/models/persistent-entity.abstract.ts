import { CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export abstract class PersistentEntity {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    public id: string;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    public createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    public updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
    public deletedAt: Date | null;

    public get isActive(): boolean {
        return !this.deletedAt;
    }
}
