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
        length: 32
    })
    name: string;

    @Column({
        name: 'desc',
        type: 'varchar',
        length: 64
    })
    description: string;

    @Column({
        name: 'img',
        type: 'varchar',
        length: 64
    })
    image: string;

    @OneToMany(() => DailyPlanExercise, exercise => exercise.dailyPlan)
    exercises: DailyPlanExercise[];
}
