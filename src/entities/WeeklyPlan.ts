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
import { User } from "./User";
import {DailyPlan} from "./DailyPlan";

@Entity('weekly_plan')
export class WeeklyPlan extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.weeklyPlans)
    user: User;

    @ManyToOne(() => DailyPlan)
    monday: DailyPlan;

    @ManyToOne(() => DailyPlan)
    tuesday: DailyPlan;

    @ManyToOne(() => DailyPlan)
    wednesday: DailyPlan;

    @ManyToOne(() => DailyPlan)
    thursday: DailyPlan;

    @ManyToOne(() => DailyPlan)
    friday: DailyPlan;

    @ManyToOne(() => DailyPlan)
    saturday: DailyPlan;

    @ManyToOne(() => DailyPlan)
    sunday: DailyPlan;
}
