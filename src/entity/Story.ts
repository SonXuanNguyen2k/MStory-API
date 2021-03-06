import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { ulid } from "ulid";
import Project from "./Project";
import StoryOwner from "./StoryOwner";
import TrackingDate from "./TrackingDate";
import User from "./User";

@Entity({ name: "stories" })
export default class Story extends TrackingDate {
    @PrimaryColumn({ type: "char", length: 26 })
    story_id: string;

    @Column({ type: "varchar", length: 80 })
    title: string;

    @Column({ type: "varchar", length: 7 })
    type: string;

    @Column({ type: "smallint" })
    points: number

    @Column({ type: "varchar", length: 5000, nullable: true })
    description: string

    @Column({ type: "varchar", length: 9, default: 'unstarted' })
    status: string

    // One user creates 0-n stories
    @ManyToOne(type => User, user => user.stories_created)
    // The user currently tackling with a story must not be deleted
    @JoinColumn({ name: "creator_id" })
    creator: User

    // A project has 0-n stories
    @ManyToOne(type => Project, project => project.stories, { onDelete: 'CASCADE' })
    // Projects having user stories must not be deleted
    @JoinColumn({ name: "project_id" })
    project: Project

    // A story has 0-n owners
    @OneToMany(type => StoryOwner, storyOwner => storyOwner.story)
    owners: StoryOwner[]

    @BeforeInsert()
    private beforeInsert() {
        this.story_id = ulid()
    }
}
