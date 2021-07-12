import { Resolver, Ctx, Arg, Mutation, InputType, Field, ObjectType } from "type-graphql";
import { MyContext } from "src/types";
import argon2 from 'argon2';
import { User } from "../entities/User";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]

  @Field(() => User, { nullable: true })
  user?: User
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [{
          field: 'username',
          message: 'Keep a longer username'
        }]
      }
    }

    if (options.password.length <= 3) {
      return {
        errors: [{
          field: 'password',
          message: 'Keep a longer password'
        }]
      }
    }
    const hashedPassword = await argon2.hash(options.password)
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
    }); 
    try {
      await em.persistAndFlush(user);
    } catch(error) {
      if (error.code === '23505') {
        return {
          errors: [{
            field: 'username',
            message: 'Username already exists'
          }]
        }
      }
      console.log('Error:', error.message);
    }
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username });
    if (!user) {
      return {
        errors: [{
          field: 'username',
          message: 'Could not find a matching username' 
        }]
      }
    }
    console.log(user)
    const isValid = await argon2.verify(user.password, options.password);
    if (!isValid) {
      return {
        errors: [{
          field: 'password',
          message: 'Password does not match' 
        }]
      }
    }
    return { user };
  }
}