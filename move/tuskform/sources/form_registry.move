module tuskform::form_registry {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use std::string::String;
    use std::vector;

    /// Shared object representing a single Form
    public struct Form has key, store {
        id: UID,
        owner: address,
        form_blob_id: String,
        submissions: vector<String>,
    }

    /// Owned object that acts as a pointer so the Admin can find their shared Form on-chain
    public struct FormAdminCap has key, store {
        id: UID,
        form_id: ID,
    }

    public struct FormCreated has copy, drop {
        form_id: ID,
        owner: address,
        form_blob_id: String,
    }

    public struct SubmissionAdded has copy, drop {
        form_id: ID,
        submission_blob_id: String,
    }

    /// Admin creates a form by saving the Walrus Blob ID of the form metadata
    public entry fun create_form(form_blob_id: String, ctx: &mut TxContext) {
        let form = Form {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            form_blob_id,
            submissions: vector::empty(),
        };
        let form_id = object::id(&form);
        
        // Give the admin a capability object so they can find their form in their wallet
        let admin_cap = FormAdminCap {
            id: object::new(ctx),
            form_id,
        };
        transfer::public_transfer(admin_cap, tx_context::sender(ctx));

        event::emit(FormCreated {
            form_id,
            owner: tx_context::sender(ctx),
            form_blob_id,
        });
        
        transfer::share_object(form);
    }

    /// Submitter adds a response by saving the Walrus Blob ID of their submission
    public entry fun add_submission(form: &mut Form, submission_blob_id: String, _ctx: &mut TxContext) {
        vector::push_back(&mut form.submissions, submission_blob_id);
        event::emit(SubmissionAdded {
            form_id: object::id(form),
            submission_blob_id,
        });
    }
}
