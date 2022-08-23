import NextAuth from 'next-auth';
import { withSentry } from '@sentry/nextjs';
import DiscordProvider from 'next-auth/providers/discord';
import db from 'lib/db';

async function signinUser(session) {
  let user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      _count: {
        select: { layouts: true }
      }
    }
  });

  if (session.user.email && !user) {
    user = await db.user.create({
      data: {
        name: session.user.name,
        email: session.user.email
      }
    });
  }

  return user;
}

export const authOptions = {
  providers: [
    DiscordProvider({
      id: 'discord',
      name: 'Discord',
      clientId: process.env.DISCORD_ID,
      clientSecret: process.env.DISCORD_SECRET
    })
  ],

  callbacks: {
    async session({ session }) {
      const user = await signinUser(session);

      // eslint-disable-next-line no-param-reassign
      session.user = {
        ...session.user,
        ...user
      };

      return session;
    }
  },

  pages: {
    signIn: '/'
  },

  secret: process.env.JWT_SECRET
};

export default withSentry(NextAuth(authOptions));