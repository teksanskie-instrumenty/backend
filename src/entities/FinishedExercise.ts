import {
    Entity,
    BaseEntity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne
} from "typeorm";
import { DailyPlanExercise } from "./DailyPlanExercise";

@Entity('finished_exercise')
export class FinishedExercise extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => DailyPlanExercise)
    dailyPlanExercise: DailyPlanExercise;

    @Column()
    user_id: number;

    @Column({ type: 'timestamp' })
    when_finished: Date;
}
