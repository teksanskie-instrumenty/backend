import {
    Entity,
    BaseEntity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne, JoinColumn, OneToOne
} from "typeorm";
import { DailyPlanExercise } from "./DailyPlanExercise";
import {Exercise} from "./Exercise";

@Entity('finished_exercise')
export class FinishedExercise extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Exercise, exercise => exercise.finishedExercise)
    @JoinColumn({ name: 'exercise_id' })
    exercise: Exercise;

    @Column()
    user_id: string;

    @Column({ type: 'timestamp' })
    when_finished: Date;
}
