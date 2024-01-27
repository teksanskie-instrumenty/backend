import {
    Entity,
    BaseEntity,
    Column,
    PrimaryColumn,
    OneToMany,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn, ManyToOne
} from "typeorm";
import { Station } from "./Station";
import {FinishedExercise} from "./FinishedExercise";

@Entity('exercise')
export class Exercise extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Station, station => station.exercises)
    @JoinColumn({ name: 'station_id' })
    station: Station;

    @Column({ type: 'bigint' })
    station_id: number;

    @Column({
        length: 32
    })
    name: string;

    @Column({
        length: 32
    })
    pace: string;

    @OneToOne(() => FinishedExercise, finishedExercise => finishedExercise.exercise)
    finishedExercise: FinishedExercise;
}
