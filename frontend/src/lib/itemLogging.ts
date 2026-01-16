import { supabase } from './supabase';

interface WasteItem {
  name: string;
  category: 'compost' | 'plastic' | 'paper' | 'metal' | 'glass' | 'organic' | 'landfill';
  recyclable: boolean;
  confidence?: number;
  description?: string;
}

export function calculateCurrency(item: WasteItem) {
  let recycling = 0;
  let trash = 0;
  let compost = 0;

  // Base currency by category
  if (['compost', 'organic'].includes(item.category)) {
    compost = 10;
  } else if (item.recyclable) {
    recycling = 10;
  } else {
    trash = 5;
  }

  // Bonus for high confidence
  if (item.confidence && item.confidence > 90) {
    if (recycling > 0) recycling += 2;
    if (trash > 0) trash += 2;
    if (compost > 0) compost += 2;
  }

  return { recycling, trash, compost };
}

export async function logItems(
  userId: string,
  items: WasteItem[],
  imageData?: string
) {
  try {
    // Calculate total currency earned
    let totalRecycling = 0;
    let totalTrash = 0;
    let totalCompost = 0;

    const itemsToInsert = items.map((item) => {
      const currency = calculateCurrency(item);
      totalRecycling += currency.recycling;
      totalTrash += currency.trash;
      totalCompost += currency.compost;

      return {
        user_id: userId,
        item_name: item.name,
        category: item.category,
        recyclable: item.recyclable,
        confidence: item.confidence,
        description: item.description,
        recycling_earned: currency.recycling,
        trash_earned: currency.trash,
        compost_earned: currency.compost,
        image_data: imageData,
      };
    });

    // Insert logged items
    const { error: itemsError } = await supabase
      .from('logged_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    // Update user currency
    const { error: userError } = await supabase.rpc('update_user_currency', {
      p_user_id: userId,
      p_recycling: totalRecycling,
      p_trash: totalTrash,
      p_compost: totalCompost,
      p_items_count: items.length,
    });

    if (userError) throw userError;

    return {
      success: true,
      earned: {
        recycling: totalRecycling,
        trash: totalTrash,
        compost: totalCompost,
      },
    };
  } catch (error) {
    console.error('Error logging items:', error);
    throw error;
  }
}
