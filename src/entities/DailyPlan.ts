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
import { DailyPlanExercise } from "./DailyPlanExercise";

@Entity('daily_plan')
export class DailyPlan extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique: true,
        length: 32
    })
    name: string;

    @OneToMany(() => DailyPlanExercise, exercise => exercise.dailyPlan)
    exercises: DailyPlanExercise[];
}
