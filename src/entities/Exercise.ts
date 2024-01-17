import {
    Entity,
    BaseEntity,
    Column,
    PrimaryColumn,
    OneToMany,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn
} from "typeorm";

@Entity('exercise')
export class Exercise extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'bigint' })
    station_id: number;

    @Column({
        unique: true,
        length: 32
    })
    name: string;

    @Column({
        unique: true,
        length: 32
    })
    pace: string;
}
