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
import {Exercise} from "./Exercise";

@Entity('station')
export class Station extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(() => Exercise, exercise => exercise.station)
    exercises: Exercise[];

    @Column({
        length: 32
    })
    name: string;

    @Column({
        name: 'color',
        type: 'varchar',
        length: 16
    })
    color: string;
}
