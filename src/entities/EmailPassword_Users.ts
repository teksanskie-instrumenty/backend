import {Entity, Column, PrimaryColumn, JoinColumn, OneToOne} from "typeorm";
import {User} from "./User";

@Entity('emailpassword_users')
export class EmailPassword_Users {
    @PrimaryColumn({ type: 'varchar', length: 64, default: 'public' })
    app_id: string;

    @PrimaryColumn({ length: 36, unique: true })
    user_id: string;

    @OneToOne(() => User)
    @JoinColumn({ name: "id" })
    user: User;

    @Column({ type: 'varchar', length: 256 })
    email: string;

    @Column({ type: 'varchar', length: 256 })
    password_hash: string;

    @Column({ type: 'bigint' })
    time_joined: number;
}
