module tuskform::seal_policy {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;

    /// The Admin Capability required to decrypt form submissions.
    /// In the SEAL protocol, holding this capability is proof of authorization.
    public struct AdminCap has key, store {
        id: UID,
    }

    /// Initialize the module and mint the very first AdminCap to the deployer.
    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        transfer::public_transfer(admin_cap, tx_context::sender(ctx));
    }

    /// Mint a new AdminCap. 
    /// Only someone who already holds an AdminCap can mint another one (e.g., for a co-admin).
    public entry fun mint_admin_cap(_admin: &AdminCap, recipient: address, ctx: &mut TxContext) {
        let new_cap = AdminCap {
            id: object::new(ctx),
        };
        transfer::public_transfer(new_cap, recipient);
    }

    /// Allows ANY user to create a form and get their own encryption capability.
    /// This makes TuskForm a fully decentralized, permissionless platform.
    public entry fun register_new_form(ctx: &mut TxContext) {
        let new_form_cap = AdminCap {
            id: object::new(ctx),
        };
        transfer::public_transfer(new_form_cap, tx_context::sender(ctx));
    }

    /// The SEAL Protocol calls this function to verify decryption access.
    /// By requiring a reference to the `AdminCap` (`&AdminCap`), the Sui runtime
    /// guarantees that only the holder of an AdminCap can successfully execute this transaction.
    /// Therefore, if this function completes successfully, SEAL grants the decryption shares.
    public entry fun seal_approve(_id: vector<u8>, _admin_cap: &AdminCap) {
        // Access is implicitly approved because the caller successfully provided a reference to `AdminCap`.
        // The `_id` represents the specific SEAL data ID being requested.
    }
}
