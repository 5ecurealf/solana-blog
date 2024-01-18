use anchor_lang::prelude::*;

pub mod constant;
pub mod states;
use crate::{constant::*, states::*};

// This is your program's public key and it will update
// automatically when you build the project.
declare_id!("DG21mWYLBqU7xaSxFuzaFduzTWNW6o5GnQVJkEbWpFM3");

#[program]
pub mod blog_sol {
    use super::*;


    pub fn init_user(ctx : Context<InitUser>, name : String, avatar: String) -> Result<()> {
        
        let user_account = &mut ctx.accounts.user_account;
        let authority = &mut ctx.accounts.authority;

        user_account.name = name;
        user_account.avatar = avatar;
        user_account.last_post_id = 0; // initialise to 0 when the user is initialised 
        user_account.post_count= 0; 
        user_account.authority = authority.key();
        
        Ok(())
    }

    pub fn create_post(ctx : Context<CreatePost>, title : String, content : String) -> Result<()>{
        // initialise a post and set properties 
        // increment the post total and the id 

        let post_account = &mut ctx.accounts.post_account;
        let user_account = &mut ctx.accounts.user_account;
        let authority = &mut ctx.accounts.authority;

        post_account.id = user_account.last_post_id + 1;
        post_account.title = title;
        post_account.content = content;
        post_account.user = user_account.key();
        post_account.authority = authority.key();

        // Increase post id by 1
        user_account.last_post_id = user_account.last_post_id.checked_add(1).unwrap();
        user_account.post_count = user_account.post_count.checked_add(1).unwrap();

        Ok(())
    }

}

#[derive(Accounts)]
#[instruction()]
pub struct CreatePost<'info> {
    #[account(  
        init,
        seeds = [POST_SEED, authority.key().as_ref(),&[user_account.last_post_id]], // last post adds to seed randomness 
        bump,
        payer = authority,
        space = 2376 + 8
    )]

    pub post_account: Account<'info,PostAccount>,

    #[account(
        mut,
        seeds = [USER_SEED, authority.key().as_ref()],
        bump,
        has_one = authority
    )]

    pub user_account : Account<'info,UserAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info,System>,
}

#[derive(Accounts)]
#[instruction()]
pub struct InitUser<'info>{ // info is like a lifetime variable, lives as long as it needs to live 
    #[account(
        init,
        seeds = [USER_SEED, authority.key().as_ref()],
        bump,
        payer = authority,
        space = 2312 + 8 // the 8 helps seperate the data in memory 
    )]

    pub user_account: Account<'info,UserAccount>,

    #[account(mut)]
    pub authority : Signer<'info>,

    pub system_program: Program<'info,System>,
} 
