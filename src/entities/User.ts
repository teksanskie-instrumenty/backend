import {
    Entity,
    BaseEntity,
    Column,
    PrimaryColumn,
    OneToMany,
    JoinColumn,
    OneToOne, ManyToOne
} from "typeorm";
import { EmailPassword_Users } from "./EmailPassword_Users";
import { WeeklyPlan } from "./WeeklyPlan";

@Entity('user')
export class User extends BaseEntity {
    @PrimaryColumn({
        unique: true,
        length: 256
    })
    id: string;

    @OneToOne(
        () => EmailPassword_Users
    )
    @JoinColumn([
        {name: 'id', referencedColumnName: 'user_id'},
        {name: 'app_id', referencedColumnName: 'app_id'}
    ])
    emailPasswordUser: EmailPassword_Users;

    @OneToMany(() => WeeklyPlan, weeklyPlan => weeklyPlan.user)
    weeklyPlans: WeeklyPlan[];

    @Column({
        unique: true,
        length: 32
    })
    nick: string;

    @Column({
        unique: true,
        length: 128,
        nullable: true
    })
    card_id: string;
}
