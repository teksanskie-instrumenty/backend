import {
    Entity,
    BaseEntity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne
} from "typeorm";
import { DailyPlan } from "./DailyPlan";
import {Exercise} from "./Exercise";

@Entity('daily_plan_exercise')
export class DailyPlanExercise extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => DailyPlan, dailyPlan => dailyPlan.exercises)
    dailyPlan: DailyPlan;

    @ManyToOne(() => Exercise)
    exercise: Exercise;

    @Column()
    order: number;

    // serie
    @Column()
    sets: number;

    // powtórzenia
    @Column()
    repetitions: number;

    @Column()
    interval: number;
}
