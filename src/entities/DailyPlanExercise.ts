import {
    Entity,
    BaseEntity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne, JoinColumn
} from "typeorm";
import { DailyPlan } from "./DailyPlan";
import { Exercise } from "./Exercise";

@Entity('daily_plan_exercise')
export class DailyPlanExercise extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => DailyPlan, dailyPlan => dailyPlan.exercises, { nullable: true })
    @JoinColumn({ name: 'daily_plan_id' })
    dailyPlan?: DailyPlan;

    @ManyToOne(() => Exercise)
    @JoinColumn({ name: 'exercise_id' })
    exercise: Exercise;

    @Column()
    order: number;

    @Column()
    sets: number;

    @Column()
    repetitions: number;

    @Column()
    interval: number;
}
