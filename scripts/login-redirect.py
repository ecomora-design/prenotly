path = "app/login/page.tsx"
with open(path) as f:
    c = f.read()

old = '''    if (error) {
      setError("Email o password non corretti");
      setLoading(false);
      return;
    }

    const next = searchParams.get("next") || "/dashboard";
    router.push(next);
    router.refresh();
  };'''

new = '''    if (error) {
      setError("Email o password non corretti");
      setLoading(false);
      return;
    }

    const next = searchParams.get("next");

    // Controlla se l'utente è uno staff (operatore)
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      const { data: staffRow } = await supabase
        .from("staff")
        .select("id")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (staffRow) {
        // È un operatore → dashboard staff
        router.push("/staff/dashboard");
        router.refresh();
        return;
      }
    }

    router.push(next || "/dashboard");
    router.refresh();
  };'''

if old not in c:
    print("FAIL: blocco login non trovato")
    exit(1)
c = c.replace(old, new, 1)
with open(path, "w") as f:
    f.write(c)
print("✅ Login con redirect staff")
